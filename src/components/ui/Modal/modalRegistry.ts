export type ModalCloseHandler = () => void;

const activeModalSubscribers = new Map<string, ModalCloseHandler>();
let currentOpenModalId: string | null = null;

export const modalRegistry = {
    register: (id: string, forceClose: ModalCloseHandler) => {
        activeModalSubscribers.set(id, forceClose);
    },
    unregister: (id: string) => {
        activeModalSubscribers.delete(id);
        if (currentOpenModalId === id) {
            currentOpenModalId = null;
        }
    },
    notifyOpened: (openedId: string) => {
        activeModalSubscribers.forEach((forceClose, id) => {
            if (id !== openedId) {
                forceClose();
            }
        });
        currentOpenModalId = openedId;
    },
    notifyClosed: (closedId: string) => {
        if (currentOpenModalId === closedId) {
            currentOpenModalId = null;
        }
    },
    getCurrentOpenModalId: () => currentOpenModalId,
    getSubscribersCount: () => activeModalSubscribers.size,
    reset: () => {
        activeModalSubscribers.clear();
        currentOpenModalId = null;
    },
};
