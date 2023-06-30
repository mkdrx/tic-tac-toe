export const Square = ({ children, isSelected, updateBoard, index }) => {
  const className = `square ${isSelected ? "is-selected" : ""}`;

  const clickHandler = () => {
    updateBoard(index);
  };

  return (
    <div onClick={clickHandler} className={className}>
      {children}
    </div>
  );
};
