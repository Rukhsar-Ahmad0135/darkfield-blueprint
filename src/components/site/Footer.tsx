import { Link } from "@tanstack/react-router";
import { LogoMark } from "./Navbar";

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="text-mono text-[11px] uppercase tracking-[0.22em]">
                Dark Field <span className="text-text-muted">/ Tech Labs</span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm text-muted-foreground">
              Engineering intelligent systems across wireless, stealth, surveillance, and core
              infrastructure for high-stakes environments.
            </p>
          </div>

          <FooterCol
            title="Company"
            items={[
              { to: "/technologies", label: "Technologies" },
              { to: "/services", label: "Services" },
              { to: "/research", label: "Research" },
            ]}
          />
          <FooterCol
            title="People"
            items={[
              { to: "/careers", label: "Careers" },
              { to: "/careers", label: "Apply" },
              { to: "/contact", label: "Contact" },
            ]}
          />
          <FooterCol
            title="Legal"
            items={[
              { to: "/", label: "Privacy" },
              { to: "/", label: "Terms" },
              { to: "/", label: "Compliance" },
            ]}
          />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 text-[11px] uppercase tracking-[0.18em] text-text-muted md:flex-row">
          <span>© 2026 Dark Field Tech Labs</span>
          <span>R&D · Wireless · Stealth · Systems</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { to: string; label: string }[];
}) {
  return (
    <div className="md:col-span-2">
      <div className="eyebrow mb-4">{title}</div>
      <ul className="space-y-2">
        {items.map((i, idx) => (
          <li key={idx}>
            <Link to={i.to} className="text-sm text-muted-foreground hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
