import Modal from "../UI/Modal";
import ListForm from "../Forms/ListForm";
import type { CreateListRequestDTO } from "../../types/list";

interface CreateListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreateListRequestDTO) => Promise<void>;
}

const CreateListModal = ({ isOpen, onClose, onCreate }: CreateListModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Crear nueva lista"
            hideFooter={true}
        >
            <ListForm 
                onSubmit={onCreate} 
                onCancel={onClose} 
                submitLabel="Crear lista"
            />
        </Modal>
    );
};

export default CreateListModal;
