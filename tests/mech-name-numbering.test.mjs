import assert from 'node:assert/strict';
import { after, before, test as nodeTest } from 'node:test';
import { createPinia } from 'pinia';
import { attachPiniaScope } from 'pinia-scope';
import { createApp } from 'vue';
import { createServer } from 'vite';

let server;
let useMechStore;
let useTeamStore;
let MECH_TEAM;

before(async () => {
    server = await createServer({
        configFile: false,
        server: { middlewareMode: true, watch: null, hmr: false },
        appType: 'custom',
        optimizeDeps: { noDiscovery: true, include: [] },
    });
    ({ useMechStore } = await server.ssrLoadModule('/src/store/mech-store.ts'));
    ({ useTeamStore } = await server.ssrLoadModule('/src/store/team-store.ts'));
    ({ MECH_TEAM } = await server.ssrLoadModule('/src/data/mech-teams.ts'));
});

after(async () => {
    await server?.close();
});

function test(name, run) {
    nodeTest(name, () => {
        const pinia = createPinia();
        attachPiniaScope(pinia);
        const app = createApp({});
        app.use(pinia);
        app.runWithContext(run);
    });
}

let scopeIndex = 0;

function army() {
    const scope = `test-${scopeIndex++}`;
    const mechs = useMechStore(scope);
    const teams = useTeamStore(scope);
    return {
        mechs,
        add: (name = '', team = MECH_TEAM.GENERAL) => teams.addMechToTeam(team, 'A', { name }),
        duplicate(id) {
            mechs.duplicateMech(id);
            return mechs.mechs.at(-1);
        },
    };
}

test('increments the final number and preserves the original mech', () => {
    const { mechs, add, duplicate } = army();
    const id = add('Wolf Mk2-1');
    mechs.addMechWeaponAttachment(id, 'LASER');
    mechs.addMechUpgradeAttachment(id, 'JUMP_JETS');
    const original = JSON.parse(JSON.stringify(mechs.getMech(id)));
    const copy = duplicate(id);
    assert.equal(copy.name, 'Wolf Mk2-2');
    assert.deepEqual(mechs.getMech(id), original);
    assert.deepEqual(copy.weapons, original.weapons);
    assert.deepEqual(copy.upgrades, original.upgrades);
    assert.notEqual(copy.id, id);
});

test('skips occupied names across teams and stops at the first free number', () => {
    const { add, duplicate } = army();
    const id = add('Wolf 1');
    add('Wolf 2');
    add('Wolf 3', MECH_TEAM.SHELF);
    add('Wolf 5');
    assert.equal(duplicate(id).name, 'Wolf 4');
    assert.equal(duplicate(id).name, 'Wolf 6');
});

test('increments a duplicate when it is itself duplicated', () => {
    const { add, duplicate } = army();
    const copy = duplicate(add('Wolf 7'));
    assert.equal(duplicate(copy.id).name, 'Wolf 9');
});

test('preserves leading zeros and allows the number to grow in width', () => {
    const { add, duplicate } = army();
    const id = add('Wolf 009');
    add('Wolf 010');
    assert.equal(duplicate(id).name, 'Wolf 011');
    assert.equal(duplicate(add('Wolf 099')).name, 'Wolf 100');
    assert.equal(duplicate(add('Wolf 999')).name, 'Wolf 1000');
});

test('handles zero, purely numeric names, and numbers beyond safe integer precision', () => {
    const { add, duplicate } = army();
    assert.equal(duplicate(add('Wolf 0')).name, 'Wolf 1');
    assert.equal(duplicate(add('9')).name, '10');
    assert.equal(duplicate(add('Wolf 9007199254740992')).name, 'Wolf 9007199254740993');
});

test('checks conflicts with visible default names', () => {
    const { add, duplicate } = army();
    add();
    const id = add('HE-V-0');
    assert.equal(duplicate(id).name, 'HE-V-2');
});

test('keeps default naming for unnamed mechs and custom names without a trailing number', () => {
    const { mechs, add, duplicate } = army();
    for (const name of ['', 'Wolf', 'Wolf 1 Alpha']) {
        const copy = duplicate(add(name));
        assert.equal(copy.name, '');
        assert.equal(mechs.getMechInfo(copy.id).display_name, `HE-V-${copy.id}`);
    }
});

test('does not reserve names from another army list', () => {
    const first = army();
    first.add('Wolf 2');
    const second = army();
    assert.equal(second.duplicate(second.add('Wolf 1')).name, 'Wolf 2');
});
