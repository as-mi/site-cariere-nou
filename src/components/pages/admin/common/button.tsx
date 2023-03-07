type ButtonProps<
  P,
  C extends keyof JSX.IntrinsicElements | React.ComponentType<P>
> = {
  children: React.ReactNode;
  element?: C;
} & React.ComponentPropsWithoutRef<C>;

const Button = <C extends React.ElementType = "button">({
  element,
  children,
  ...otherProps
}: ButtonProps<React.ComponentPropsWithoutRef<C>, C>) => {
  const Element = (element ?? "button") as React.ElementType;
  return (
    <Element
      {...otherProps}
      className="inline-block rounded-md bg-blue-600 py-2 px-3 hover:bg-blue-500 active:bg-blue-400 active:text-gray-800"
    >
      {children}
    </Element>
  );
};

export default Button;
