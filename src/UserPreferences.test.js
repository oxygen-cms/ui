import UserPreferences from './UserPreferences';
import AuthApi from "./AuthApi";

jest.mock('./AuthApi');


test('gets and sets preferences', async () => {
    AuthApi.userDetails.mockResolvedValue({
        user: {
            preferences: {
                foo: 'bar',
                baz: { qux: 'fub '}
            }
        }
    });

    expect(await UserPreferences.get('foo')).toBe('bar');
    expect(await UserPreferences.has('fob')).toBe(false);
    expect(await UserPreferences.has('baz.qux')).toBe(true);
    expect(await UserPreferences.get('bar.qux2', 'fallback')).toBe('fallback');

});
