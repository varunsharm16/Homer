export default function ProductIllustration({ type, color = "#bca285" }) {
  const dark = "#6b5743";
  return (
    <svg
      viewBox="0 0 180 130"
      role="img"
      aria-label={`${type.replaceAll("_", " ")} reference illustration`}
    >
      <ellipse cx="90" cy="110" rx="57" ry="8" fill="#786650" opacity=".09" />
      {type === "sofa" ? (
        <g>
          <path d="M28 75L91 63l61 12v24l-63 15-61-19z" fill={color} />
          <path d="M36 42L90 32l54 10v37l-54 12-54-12z" fill={color} />
          <path d="M37 76l53 12 54-12" fill="none" stroke="#a89b87" />
          <path d="M89 34v52" stroke="#b5a997" />
          <path d="M26 65l12-3v31l-12 3zm117-3 13 3v29l-13 3" fill="#c3b7a4" />
          <path d="M35 97v12m108-12v12" stroke={dark} strokeWidth="4" />
        </g>
      ) : type === "armchair" || type === "dining_chair" ? (
        <g>
          <path d="M60 44q30-20 59 0l-5 39-52 1z" fill={color} />
          <path d="M57 78l30-10 34 10-30 14z" fill="#d8c8b3" />
          <path
            d="M61 83l-8 26m61-26 8 26M66 44 61 80m54-36 5 37"
            stroke={dark}
            strokeWidth="5"
          />
          <path
            d="M54 66l-2 15 32 9m43-24 2 15-38 9"
            stroke={color}
            strokeWidth="7"
            fill="none"
          />
        </g>
      ) : type.includes("table") ? (
        <g>
          <path d="M40 86v25m94-28v26M83 69v24" stroke={dark} strokeWidth="6" />
          <ellipse cx="89" cy="77" rx="56" ry="22" fill={color} />
          <path
            d="M33 77q56 36 112 0v6q-56 34-112 0z"
            fill={dark}
            opacity=".4"
          />
        </g>
      ) : type.includes("bed") ? (
        <g>
          <path d="M43 60V36l80-9v39" fill={color} />
          <path d="M37 62l69-10 44 41-75 17-38-28z" fill="#f3ece0" />
          <path d="M40 72l35 31 75-14v10l-75 17-35-31z" fill={color} />
          <path
            d="M52 59l22-3 14 13-23 4zm30-4 23-3 15 13-23 5z"
            fill="#e0d5c2"
          />
        </g>
      ) : type === "bookshelf" ? (
        <g>
          <path d="M51 30h79v77H51z" fill={color} />
          {[40, 60, 80, 100].map((y) => (
            <path key={y} d={`M57 ${y}h67v-5H57z`} fill={dark} />
          ))}
          <path
            d="M62 44v11m12-13v13m31 9v11m9-9v9"
            stroke="#dbceb8"
            strokeWidth="7"
          />
        </g>
      ) : type === "plant" ? (
        <g>
          <path d="M71 85h39l-5 27H77z" fill="#bbaa8c" />
          <path d="M90 87V35" stroke={dark} strokeWidth="3" />
          {[
            [80, 49],
            [104, 54],
            [87, 33],
            [70, 62],
            [95, 68],
          ].map(([x, y]) => (
            <ellipse key={x} cx={x} cy={y} rx="17" ry="14" fill={color} />
          ))}
        </g>
      ) : type === "art" ? (
        <g>
          <path d="M54 24h73v88H54z" fill={dark} />
          <path d="M59 29h63v78H59z" fill="#e5d8bf" />
          <circle cx="85" cy="75" r="20" fill={color} />
          <path d="M99 41h14v40H99z" fill="#ba9f7a" />
        </g>
      ) : type === "appliance" ? (
        <g>
          <rect x="62" y="23" width="58" height="87" rx="4" fill={color} />
          <path
            d="M64 49h54m-47-15v10m0 14v18"
            stroke="#777971"
            strokeWidth="3"
          />
        </g>
      ) : type === "rug" ? (
        <g>
          <path d="M27 84l73-30 55 34-74 30z" fill={color} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M${35 + i * 10} ${83 + i * 6}l72-29`}
              stroke="#c2b49c"
              opacity=".6"
            />
          ))}
        </g>
      ) : (
        <g>
          <rect x="39" y="28" width="103" height="78" rx="3" fill={color} />
          {type === "wood" &&
            [55, 75, 95, 115].map((x) => (
              <path key={x} d={`M${x} 28v78`} stroke="#a68a68" />
            ))}
          {type === "tile" && <path d="M90 28v78M39 67h103" stroke="#b8ad9d" />}
        </g>
      )}
    </svg>
  );
}
