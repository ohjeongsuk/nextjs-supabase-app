import { CalendarPlus, Link2, Users } from "lucide-react";
import { GoogleLoginButton } from "@/components/google-login-button";

const features = [
  {
    icon: CalendarPlus,
    title: "간편한 이벤트 생성",
    description: "제목, 날짜, 장소만 입력하면 즉시 이벤트가 생성돼요",
  },
  {
    icon: Link2,
    title: "원클릭 초대",
    description: "초대 링크 하나로 카카오톡에서 바로 공유할 수 있어요",
  },
  {
    icon: Users,
    title: "실시간 참여자 관리",
    description: "참여자 목록이 실시간으로 자동 업데이트돼요",
  },
];

export function LandingHero() {
  return (
    <div className="flex flex-col gap-10 px-5 py-10">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-foreground">Gather</h1>
        <p className="text-muted-foreground">
          초대 링크 하나로 모든 것을 해결하는
          <br />
          일회성 이벤트 관리 플랫폼
        </p>
      </div>

      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <feature.icon className="size-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">{feature.title}</p>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <GoogleLoginButton />
    </div>
  );
}
