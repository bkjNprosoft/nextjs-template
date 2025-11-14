declare module "@storybook/react" {
  export type Meta<T> = {
    title: string;
    component: T;
    args?: Record<string, unknown>;
  };

  export type StoryObj<T> = {
    args?: Partial<T>;
  };
}

