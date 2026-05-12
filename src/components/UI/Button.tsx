import type { ButtonHTMLAttributes } from "react";
import "./button.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    layout?: 'normal' | 'icon',
    variant?: 'text' | 'contained' | 'outlined'
}

const Button: React.FC<ButtonProps> = ({ children, layout = "normal", variant = "contained", className, ...props  }) => {
    return (
        <button className={`button btn-${variant} btn-${layout} ${className}`} {...props}>
            {children}
        </button>
    )
}

export default Button;