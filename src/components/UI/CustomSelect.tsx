import { useState } from "react";
import { Popover } from "@mui/material";
import "./customSelect.scss";

interface CustomSelectProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: Array<{ value: string | number; label: string }>;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
}

const CustomSelect = ({ 
    value, 
    onChange, 
    options, 
    placeholder = "Selecciona una opción", 
    disabled = false,
    className = "",
    id
}: CustomSelectProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(false);
    const [triggerWidth, setTriggerWidth] = useState(0);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
            setAnchorEl(event.currentTarget);
            setOpen(true);
            setTriggerWidth(event.currentTarget.offsetWidth);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        setOpen(false);
    };

    const handleSelect = (selectedValue: string | number) => {
        onChange(selectedValue);
        handleClose();
    };

    const selectedLabel = options.find(option => option.value === value)?.label || placeholder;

    return (
        <div className={`custom-select ${className}`}>
            <button
                type="button"
                id={id}
                className={`custom-select__trigger ${disabled ? 'disabled' : ''} ${open ? 'open' : ''}`}
                onClick={handleClick}
                disabled={disabled}
            >
                <span className="custom-select__value">{selectedLabel}</span>
                <span className="custom-select__arrow">▼</span>
            </button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    className: "custom-select__paper",
                    style: { width: triggerWidth }
                }}
            >
                <div className="custom-select__options">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`custom-select__option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </Popover>
        </div>
    );
};

export default CustomSelect;
