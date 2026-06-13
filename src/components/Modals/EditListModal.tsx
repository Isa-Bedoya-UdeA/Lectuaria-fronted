import Modal from "../UI/Modal";
import ListForm from "../Forms/ListForm";
import type { UserListDTO } from "../../types";

interface EditListModalProps {
    isOpen: boolean;
    list: UserListDTO | null;
    onClose: () => void;
    onSave: (data: {
        name: string;
        description: string;
        visibility: 'PUBLIC' | 'LISTED' | 'PRIVATE';
    }) => Promise<void>;
}

const EditListModal = ({ isOpen, list, onClose, onSave }: EditListModalProps) => {
    if (!list) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar lista"
            hideFooter={true}
        >
            <ListForm
                initialValues={{
                    name: list.name,
                    description: list.description ?? "",
                    visibility: list.visibility
                }}
                onSubmit={onSave}
                onCancel={onClose}
                submitLabel="Guardar cambios"
            />
        </Modal>
    );
};

export default EditListModal;
