import UserPreferences from './UserPreferences';

test('gets and sets preferences', () => {
    UserPreferences.preferences = {
        foo: 'bar',
        baz: { qux: 'fub '}
    };
    expect(UserPreferences.get('foo')).toBe('bar');
    expect(UserPreferences.has('fob')).toBe(false);
    expect(UserPreferences.has('baz.qux')).toBe(true);
    expect(UserPreferences.get('bar.qux2', 'fallback')).toBe('fallback');
});