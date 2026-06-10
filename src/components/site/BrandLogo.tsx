import logoAsset from "@/assets/dftl-logo.asset.json";

type Props = {
  className?: string;
  alt?: string;
};

/**
 * Official DFTL brand mark — Sierpinski triangle.
 * Uses the client-supplied logo image so every surface stays on-brand.
 */
export function BrandLogo({ className = "", alt = "Dark Field Tech Labs" }: Props) {
  return (
    <img
      src={logoAsset.url}
      alt={alt}
      className={`block select-none object-contain ${className}`}
      draggable={false}
    />
  );
}
