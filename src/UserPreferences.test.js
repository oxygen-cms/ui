import UserPreferences from './UserPreferences';

jest.mock('./AuthApi');

test('gets and sets preferences', async () => {
    UserPreferences.setBuefy({});
    let prefs = new UserPreferences({
        foo: 'bar',
        baz: { qux: 'fub '}
    });

    expect(prefs.get('foo')).toBe('bar');
    expect(prefs.has('fob')).toBe(false);
    expect(prefs.has('baz.qux')).toBe(true);
    expect(prefs.get('bar.qux2', 'fallback')).toBe('fallback');

});
