import * as React from 'react';

type ModalProps = {
  id: string;
  children?: React.ReactNode;
};

export const Modal = ({ id, children }: ModalProps) => {
  return (
    <>
      <input type="checkbox" id={id} className="modal-toggle" />
      <label htmlFor={id} className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          {children}
        </label>
      </label>
    </>
  );
};

type ModalOpenerProps = {
  id: string;
  className?: string;
  children?: React.ReactNode;
};

const ModalOpener = ({ id, children, className = 'btn modal-button' }: ModalOpenerProps) => {
  return (
    <label htmlFor={id} className={className}>
      {children}
    </label>
  );
};
Modal.Opener = ModalOpener;

export default Modal;
