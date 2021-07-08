
export const checkForUnsavedChanges = (model, serverModel, $buefy, next) => {
    if(JSON.stringify(model) === JSON.stringify(serverModel)) {
        next();
        return;
    }
    $buefy.dialog.confirm({
        message: 'If you leave now, you\'ll lose any unsaved changes',
        onConfirm: () => {
            next();
        },
        onCancel: () => {
            next(false);
        }
    });
};
