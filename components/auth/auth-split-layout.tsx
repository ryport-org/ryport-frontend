import { Logo } from "@/components/marketing/logo";
import { AuthFooter, AuthPromoPanel } from "@/components/auth/auth-promo-panel";

type AuthLayoutProps = {
  children: React.ReactNode;
  promoTitle: string;
  promoDescription: string;
};

export function AuthSplitLayout({
  children,
  promoTitle,
  promoDescription,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-paper">
      <div className="flex w-full flex-1 flex-col lg:w-1/2">
        <div className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
          <Logo />

          <div className="flex flex-1 flex-col justify-center py-10 lg:py-16">
            {children}
          </div>

          <AuthFooter />
        </div>
      </div>

      <AuthPromoPanel title={promoTitle} description={promoDescription} />
    </div>
  );
}
