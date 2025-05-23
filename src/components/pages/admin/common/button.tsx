type ButtonProps<
  P,
  C extends keyof JSX.IntrinsicElements | React.ComponentType<P>,
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
      className="inline-block rounded-md border-2 border-green-800 bg-black py-2 px-3 hover:bg-green-800 active:border-green-700"
    >
      {children}
    </Element>
  );
};

export default Button;
