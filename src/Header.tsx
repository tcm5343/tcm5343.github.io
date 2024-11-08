import styles from './Header.module.css';

const Header = () => {
  const buttons = ["Home", "About", "Services", "Contact"];

  return (
    <header className={styles.header}>
      <div className={styles.buttonContainer}>
        {buttons.map((label) => (
          <button key={label} className={styles.button}>
            {label}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;