// src/components/Forms/LibraryInfoForm.tsx
import { useAuth } from "@/context/AuthContext";
import { useZones } from "@/hooks/useZones";
import { useForm, Controller } from "react-hook-form";
import Button from "@/components/UI/Button";
import { Snackbar, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import "./libraryInfoForm.scss";
import type { ProfileUpdateRequest } from "@/types/auth";

interface LibraryInfoFormProps {
    onCancel: () => void;
    onSuccess?: () => void;
}

const LibraryInfoForm = ({ onCancel, onSuccess }: LibraryInfoFormProps) => {
    const {
        user,
        updateProfile,
        isLoading: isAuthLoading,
    } = useAuth();

    const {
        zones,
        isLoading: zonesLoading,
        error: zonesError
    } = useZones();

    const [showSuccess, setShowSuccess] = useState(false);

    // Formulario con React Hook Form
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
        reset
    } = useForm<ProfileUpdateRequest>({
        defaultValues: {
            photoUrl: user?.photoUrl || "",
            biography: user?.biography || "",
            libraryName: user?.libraryName || "",
            libraryLocation: user?.libraryAddress || "",
            contactInfo: user?.libraryContactEmail || user?.email || "",
            contactPhone: user?.libraryContactPhone || "",
            officeHours: user?.libraryOpeningHours || "",
            idZone: user?.libraryZoneId || undefined,
        }
    });

    // Watch para preview de avatar
    const watchedPhotoUrl = watch("photoUrl");

    useEffect(() => {
        if (user?.userRole === "LIBRARIAN") {
            reset({
                photoUrl: user.photoUrl || "",
                biography: user.biography || "",
                libraryName: user.libraryName || "",
                libraryLocation: user.libraryAddress || "",
                contactInfo: user.libraryContactEmail || user.email || "",
                contactPhone: user.libraryContactPhone || "",
                officeHours: user.libraryOpeningHours || "",
                idZone: user.libraryZoneId || undefined,
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileUpdateRequest) => {
        try {


            await updateProfile({
                ...data,
                libraryName: data.libraryName?.trim(),
                libraryLocation: data.libraryLocation?.trim(),
                contactInfo: data.contactInfo?.trim().toLowerCase(),
                contactPhone: data.contactPhone?.trim(),
                officeHours: data.officeHours?.trim(),
                photoUrl: data.photoUrl?.trim(),
                biography: data.biography?.trim(),
            });

            setShowSuccess(true);

            if (onSuccess) {
                onSuccess();
            }

            setTimeout(() => {
                onCancel();
            }, 1500);

        } catch (err: any) {
        }
    };

    const isLoading = isAuthLoading || zonesLoading;

    return (
        <section className="libraryInfoForm">
            <h3>Editar datos de la biblioteca</h3>

            {zonesError && (
                <div className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    No se pudieron cargar las zonas. Intenta de nuevo.
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="libraryInfoForm__form">
                <div className="libraryInfoForm__avatar-section">
                    <div className="avatar-preview">
                        <img
                            src={watchedPhotoUrl || user?.photoUrl || "/broken-image.jpg"}
                            alt="Logo de la biblioteca"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.endsWith("broken-image.jpg")) {
                                    target.src = "/broken-image.jpg";
                                }
                            }}
                        />
                    </div>
                    <div className="libraryInfoForm__group">
                        <label htmlFor="photoUrl">URL del logo *</label>
                        <input
                            type="url"
                            id="photoUrl"
                            {...register("photoUrl", {
                                pattern: {
                                    value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                                    message: "Ingresa una URL válida"
                                }
                            })}
                            placeholder="https://ejemplo.com/logo.png"
                            disabled={isLoading}
                        />
                        {errors.photoUrl && (
                            <span className="error-text">{errors.photoUrl.message}</span>
                        )}
                    </div>
                </div>

                <div className="libraryInfoForm__group">
                    <label htmlFor="libraryName">Nombre de la biblioteca *</label>
                    <input
                        type="text"
                        id="libraryName"
                        {...register("libraryName", {
                            required: "El nombre es obligatorio",
                            minLength: { value: 2, message: "Mínimo 2 caracteres" }
                        })}
                        placeholder="Ej: Biblioteca Pública Piloto"
                        disabled={isLoading}
                    />
                    {errors.libraryName && (
                        <span className="error-text">{errors.libraryName.message}</span>
                    )}
                </div>

                <div className="libraryInfoForm__group">
                    <label htmlFor="biography">Descripción</label>
                    <textarea
                        id="biography"
                        rows={3}
                        maxLength={500}
                        {...register("biography")}
                        placeholder="Breve descripción de tu biblioteca..."
                        disabled={isLoading}
                    />
                    <small>{watch("biography")?.length || 0}/500</small>
                </div>

                <div className="libraryInfoForm__row">
                    <div className="libraryInfoForm__group">
                        <label htmlFor="contactInfo">Email de contacto *</label>
                        <input
                            type="email"
                            id="contactInfo"
                            {...register("contactInfo", {
                                required: "El email es obligatorio",
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/i,
                                    message: "Email inválido"
                                }
                            })}
                            placeholder="contacto@biblioteca.gov.co"
                            disabled={isLoading}
                        />
                        {errors.contactInfo && (
                            <span className="error-text">{errors.contactInfo.message}</span>
                        )}
                    </div>

                    <div className="libraryInfoForm__group">
                        <label htmlFor="contactPhone">Teléfono</label>
                        <input
                            type="tel"
                            id="contactPhone"
                            {...register("contactPhone")}
                            placeholder="+57 4 266 6060"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="libraryInfoForm__group">
                    <label htmlFor="officeHours">Horario de atención *</label>
                    <input
                        type="text"
                        id="officeHours"
                        {...register("officeHours", {
                            required: "El horario es obligatorio"
                        })}
                        placeholder="Ej: Lun-Vie: 8am-8pm, Sáb: 9am-5pm"
                        disabled={isLoading}
                    />
                    {errors.officeHours && (
                        <span className="error-text">{errors.officeHours.message}</span>
                    )}
                </div>

                <div className="libraryInfoForm__group">
                    <label htmlFor="libraryLocation">Dirección *</label>
                    <input
                        type="text"
                        id="libraryLocation"
                        {...register("libraryLocation", {
                            required: "La dirección es obligatoria"
                        })}
                        placeholder="Carrera 43A #12-45, El Poblado"
                        disabled={isLoading}
                    />
                    {errors.libraryLocation && (
                        <span className="error-text">{errors.libraryLocation.message}</span>
                    )}
                </div>

                <div className="libraryInfoForm__group">
                    <label htmlFor="idZone">Comuna/Zona *</label>

                    <Controller
                        name="idZone"
                        control={control}
                        rules={{ required: "Debes seleccionar una zona" }}
                        render={({ field }) => (
                            <select name="idZone" id="idZone" onChange={(e) => field.onChange(Number(e.target.value))}>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id} selected={field.value === zone.id}>
                                        {zone.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                    {errors.idZone && (
                        <span className="error-text">{errors.idZone.message}</span>
                    )}
                </div>

                <div className="libraryInfoForm__actions">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Guardando...
                            </>
                        ) : (
                            "Guardar cambios"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                </div>
            </form>

            <Snackbar
                open={showSuccess}
                autoHideDuration={2000}
                onClose={() => setShowSuccess(false)}
            >
                <div className="success-snackbar">
                    ¡Datos actualizados exitosamente!
                </div>
            </Snackbar>
        </section>
    );
};

export default LibraryInfoForm;