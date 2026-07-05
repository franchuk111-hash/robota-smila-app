// Логотип-бейдж: рукостискання (Twemoji, CC-BY) на фірмовому синьому квадраті.
export default function Emblem({ size = 38 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: "#2f6fda",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hands.svg"
        alt=""
        width={Math.round(size * 0.66)}
        height={Math.round(size * 0.66)}
        style={{ display: "block" }}
      />
    </span>
  );
}
