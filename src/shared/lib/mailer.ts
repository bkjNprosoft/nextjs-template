const RESEND_API_URL = "https://api.resend.com/emails";

function getBaseUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${getBaseUrl()}/reset-password/${token}`;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      "[auth] Resend 환경 변수가 설정되지 않았습니다. 개발 모드에서는 콘솔에 링크를 출력합니다.",
    );
    console.warn(`[auth] Reset link for ${to}: ${resetUrl}`);
    return;
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "비밀번호 재설정 안내",
      html: `
        <p>안녕하세요,</p>
        <p>아래 버튼을 클릭하면 비밀번호를 재설정할 수 있습니다.</p>
        <p><a href="${resetUrl}">비밀번호 재설정하기</a></p>
        <p>만약 본인이 요청하지 않았다면 이 이메일을 무시해 주세요.</p>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[auth] Resend 이메일 전송 실패:", error);
    throw new Error("비밀번호 재설정 이메일 전송에 실패했습니다.");
  }
}

type NotificationEmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendNotificationEmail({
  to,
  subject,
  html,
}: NotificationEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      "[notifications] Resend 환경 변수가 설정되지 않아 이메일을 전송하지 못했습니다.",
    );
    return;
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[notifications] 이메일 전송 실패:", error);
    throw new Error("알림 이메일 전송에 실패했습니다.");
  }
}

