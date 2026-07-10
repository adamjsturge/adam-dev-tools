import { ButtonHTMLAttributes } from "react";
import classNames from "../utils/classNames";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  customClass?: string;
}

const variantClasses = {
  primary: "bg-ctp-blue text-ctp-base hover:bg-ctp-blue/90",
  secondary: "bg-ctp-surface1 text-ctp-text hover:bg-ctp-surface2",
  danger: "bg-ctp-red text-ctp-base hover:bg-ctp-red/90",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
};

const Button = ({
  variant = "primary",
  size = "md",
  customClass = "",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={classNames(
        "rounded-md font-semibold transition-colors duration-100",
        "disabled:bg-ctp-surface2 disabled:text-ctp-overlay0 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        customClass,
      )}
      {...props}
    />
  );
};

export default Button;
