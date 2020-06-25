export type MiddlewareBefore = (
  target: any,
  propertyName: string,
  event: object,
  args: any[],
) => Promise<void>;
