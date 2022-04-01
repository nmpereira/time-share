import "./Button.css";

const Button = ({ href, text }) => {
  return (
    <header>
      <a href={href}>{text}</a>
    </header>
  );
};

export default Button;
