import UserPreferences from './UserPreferences';
import AuthApi from "./AuthApi";

test('gets and sets preferences', () => {
    AuthApi.currentUserDetails = {
        user: {
            preferences: {
                foo: 'bar',
                baz: { qux: 'fub '}
            }
        }
    };

    expect(UserPreferences.get('foo')).toBe('bar');
    expect(UserPreferences.has('fob')).toBe(false);
    expect(UserPreferences.has('baz.qux')).toBe(true);
    expect(UserPreferences.get('bar.qux2', 'fallback')).toBe('fallback');
});
