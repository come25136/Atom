type AbstractConstructorHelper<T> = (new (...args: any) => {
  [x: string]: any
}) &
  T
type AbstractContructorParameters<T> = ConstructorParameters<
  AbstractConstructorHelper<T>
>

type AwaitReturnType<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: Array<any>) => Promise<infer V>
  ? V
  : T
