import { createContext, useContext, useState } from 'react';
import Dialog from './Dialog';

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export const CustomDialog = ({ children }) => {
  const [dialogConfig, setDialogConfig] = useState(null);

  const openDialog = (config) => {
    setDialogConfig(config);
  };

  const closeDialog = () => {
    setDialogConfig(null);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      <Dialog
        isOpen={!!dialogConfig}
        onClose={closeDialog}
        title={dialogConfig?.title}
        footer={dialogConfig?.footer}
      >
        {dialogConfig?.content}
      </Dialog>
    </DialogContext.Provider>
  );
};
