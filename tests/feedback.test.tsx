import { fireEvent, render, screen } from '@testing-library/react-native';

import { ErrorState, LoadingState } from '../src/components/ui/Feedback';

it('exposes loading status to assistive technology', async () => {
  await render(<LoadingState message="Opening Savora" />);
  expect(
    screen.getByRole('progressbar', { name: 'Opening Savora' }),
  ).toBeTruthy();
});

it('lets the user retry a failed operation', async () => {
  const retry = jest.fn();
  await render(<ErrorState onRetry={retry} />);
  expect(screen.getByRole('alert')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalledTimes(1);
});
