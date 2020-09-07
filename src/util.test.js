import { strEquals, convertStr, nestedGet, nestedSet, tryParseTelephone } from './util';

test('string equality', () => {
    expect(strEquals('hello ', '  HeLLo '));
    expect(!strEquals('hallo ', '  HeLLo '));
    expect(!strEquals('he llo ', '  HeLLo '));
});

test('converting strings to title case', () => {
    expect(convertStr('babel street ')).toBe('Babel Street');
    expect(convertStr('18 foobar lane')).toBe('18 Foobar Lane');
});

test('nested get', () => {
    expect(nestedGet({
        foo: { bar: { baz: 'qux' }}
    }, 'foo.bar.baz')).toBe('qux');
    expect(nestedGet({
        foo: { bar: { baz: 'qux' }}
    }, 'foo.bar.bez')).toBeNull();
});

test('nested set', () => {
    let v = {
        foo: { bar: { baz: 'qux' }}
    };
    nestedSet(v, 'foo.bar.baz', 'qux2');
    expect(v.foo.bar.baz).toBe('qux2');

    nestedSet(v, 'foo.b.c', 'qux3');
    expect(v.foo.b.c).toBe('qux3');
});

test('telephone parsing', () => {
    expect(tryParseTelephone('+61 0423 456 789')).toBe('0423 456 789');
    expect(tryParseTelephone('0412 456 789')).toBe('0412 456 789');
    expect(tryParseTelephone('03 9876 5432')).toBe('(03) 9876 5432');
    expect(tryParseTelephone('03 9876 54322')).toBeNull();
});
