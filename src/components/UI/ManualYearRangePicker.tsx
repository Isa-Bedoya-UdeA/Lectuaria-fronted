import { useState } from "react";
import Button from "./Button";
import "./manualYearRangePicker.scss";

interface ManualYearRangePickerProps {
    startYear: number | null;
    endYear: number | null;
    onStartYearChange: (year: number | null) => void;
    onEndYearChange: (year: number | null) => void;
}

const ManualYearRangePicker = ({
    startYear,
    endYear,
    onStartYearChange,
    onEndYearChange
}: ManualYearRangePickerProps) => {
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [isEndOpen, setIsEndOpen] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleYearSelect = (year: number, isStart: boolean) => {
        if (isStart) {
            // If selecting start year, ensure it's <= endYear (if endYear is set)
            if (endYear !== null && year > endYear) {
                return; // Don't allow start year greater than end year
            }
            onStartYearChange(year);
            setIsStartOpen(false);
        } else {
            // If selecting end year, ensure it's >= startYear (if startYear is set)
            if (startYear !== null && year < startYear) {
                return; // Don't allow end year less than start year
            }
            onEndYearChange(year);
            setIsEndOpen(false);
        }
    };

    const handleClear = () => {
        onStartYearChange(null);
        onEndYearChange(null);
    };

    return (
        <div className="manualYearRangePicker">
            <h3 className="manualYearRangePicker__label">Rango de años</h3>
            <div className="manualYearRangePicker__inputs">
                <div className="manualYearRangePicker__input-group">
                    <label>Desde</label>
                    <Button
                        variant="outlined"
                        onClick={() => setIsStartOpen(!isStartOpen)}
                        className="manualYearRangePicker__button"
                    >
                        {startYear || "Seleccionar"}
                    </Button>
                    {isStartOpen && (
                        <div className="manualYearRangePicker__dropdown">
                            <div className="manualYearRangePicker__dropdown-list">
                                {years.map(year => (
                                    <button
                                        key={year}
                                        onClick={() => handleYearSelect(year, true)}
                                        className="manualYearRangePicker__dropdown-item"
                                        disabled={endYear !== null && year > endYear}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="manualYearRangePicker__input-group">
                    <label>Hasta</label>
                    <Button
                        variant="outlined"
                        onClick={() => setIsEndOpen(!isEndOpen)}
                        className="manualYearRangePicker__button"
                    >
                        {endYear || "Seleccionar"}
                    </Button>
                    {isEndOpen && (
                        <div className="manualYearRangePicker__dropdown">
                            <div className="manualYearRangePicker__dropdown-list">
                                {years.map(year => (
                                    <button
                                        key={year}
                                        onClick={() => handleYearSelect(year, false)}
                                        className="manualYearRangePicker__dropdown-item"
                                        disabled={startYear !== null && year < startYear}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {(startYear || endYear) && (
                    <Button
                        variant="text"
                        onClick={handleClear}
                        className="manualYearRangePicker__clear"
                    >
                        Limpiar
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ManualYearRangePicker;
