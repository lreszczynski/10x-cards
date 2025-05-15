import { cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';
import { type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

afterEach(() => {
  cleanup();
});

function customRender(
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      ...options,
    }),
  };
}

export * from '@testing-library/react';
export { customRender as render };
export { userEvent }; 