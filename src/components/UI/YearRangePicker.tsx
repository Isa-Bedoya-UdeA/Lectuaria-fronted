import { useState } from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Box, Button, Typography } from "@mui/material";
import { es } from "date-fns/locale";
import "./yearRangePicker.scss";

interface YearRangePickerProps {
    startYear: number | null;
    endYear: number | null;
    onStartYearChange: (year: number | null) => void;
    onEndYearChange: (year: number | null) => void;
}

const YearRangePicker = ({ startYear, endYear, onStartYearChange, onEndYearChange }: YearRangePickerProps) => {
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    const handleClear = () => {
        onStartYearChange(null);
        onEndYearChange(null);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <div className="yearRangePicker">
                <Typography variant="subtitle2" className="yearRangePicker__label">Rango de años</Typography>
                <Box className="yearRangePicker__inputs">
                    <DatePicker
                        label="Desde"
                        views={["year"]}
                        open={openStart}
                        onOpen={() => setOpenStart(true)}
                        onClose={() => setOpenStart(false)}
                        value={startYear ? new Date(startYear, 0, 1) : null}
                        onChange={(date) => {
                            if (date) {
                                onStartYearChange(date.getFullYear());
                            } else {
                                onStartYearChange(null);
                            }
                        }}
                        slotProps={{
                            textField: {
                                size: "small",
                                fullWidth: true
                            },
                            actionBar: {
                                actions: ["cancel", "accept"]
                            }
                        }}
                        localeText={{
                            cancelButtonLabel: "Cancelar",
                            okButtonLabel: "Seleccionar"
                        }}
                    />
                    <DatePicker
                        label="Hasta"
                        views={["year"]}
                        open={openEnd}
                        onOpen={() => setOpenEnd(true)}
                        onClose={() => setOpenEnd(false)}
                        value={endYear ? new Date(endYear, 0, 1) : null}
                        onChange={(date) => {
                            if (date) {
                                onEndYearChange(date.getFullYear());
                            } else {
                                onEndYearChange(null);
                            }
                        }}
                        slotProps={{
                            textField: {
                                size: "small",
                                fullWidth: true
                            },
                            actionBar: {
                                actions: ["cancel", "accept"]
                            }
                        }}
                        localeText={{
                            cancelButtonLabel: "Cancelar",
                            okButtonLabel: "Seleccionar"
                        }}
                    />
                </Box>
                {(startYear || endYear) && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={handleClear}
                        className="yearRangePicker__clear"
                    >
                        Limpiar rango
                    </Button>
                )}
            </div>
        </LocalizationProvider>
    );
};

export default YearRangePicker;
