import { fireEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

it('navigates through the five real tab routes and the future auth route', async () => {
  await renderRouter('./app', { initialUrl: '/' });
  expect(screen).toHavePathname('/');
  expect(screen.getByRole('header', { name: 'Dashboard' })).toBeTruthy();

  for (const [title, path] of [
    ['Transactions', '/transactions'],
    ['Goals', '/goals'],
    ['Rewards', '/rewards'],
    ['Profile', '/profile'],
  ] as const) {
    await fireEvent.press(screen.getByText(title));
    expect(screen).toHavePathname(path);
    expect(screen.getByRole('header', { name: title })).toBeTruthy();
  }

  await fireEvent.press(screen.getByText('Account access preview'));
  expect(screen).toHavePathname('/sign-in');
  expect(screen.getByRole('header', { name: 'Account access' })).toBeTruthy();
  await fireEvent.press(screen.getByText('Back to Dashboard'));
  expect(screen).toHavePathname('/');
});
