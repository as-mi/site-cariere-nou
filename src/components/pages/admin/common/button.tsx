type ButtonProps<
  P,
  C extends keyof JSX.IntrinsicElements | React.ComponentType<P>
> = {
  children: React.ReactNode;
  as?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | "children">;

const Button = <C extends React.ElementType = "button">({
  as,
  children,
  ...otherProps
}: ButtonProps<React.ComponentPropsWithoutRef<C>, C>) => {
  const Element = (as ?? "button") as React.ElementType;
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
