import * as React from "react";

interface OtpEmailTemplateProps {
  otpCode: string;
}

// 🌟 DEFINISIKAN STYLES MENGGUNAKAN React.CSSProperties AGAR 100% TYPE-SAFE
const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    backgroundColor: "#f9f9ff",
    color: "#041b3c",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    minHeight: "100%",
    width: "100%",
    margin: 0,
    padding: "40px 0",
    boxSizing: "border-box"
  },
  containerTable: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e8edff",
    boxShadow: "0 4px 12px rgba(0, 30, 100, 0.02)",
    overflow: "hidden"
  },
  headerTd: {
    padding: "40px 40px 20px 40px",
    textAlign: "center"
  },
  logoText: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#003d9b",
    paddingLeft: "10px",
    verticalAlign: "middle",
    letterSpacing: "-0.5px"
  },
  heroTd: {
    padding: "20px 40px",
    textAlign: "center"
  },
  headline: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: "700",
    color: "#041b3c",
    margin: "0 0 16px 0",
    letterSpacing: "-0.5px"
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#434654",
    margin: "0 auto",
    maxWidth: "420px"
  },
  otpWrapper: {
    backgroundColor: "#f1f3ff",
    border: "1px solid #d7e2ff",
    borderRadius: "12px",
    padding: "24px",
    display: "inline-block",
    width: "100%",
    maxWidth: "380px",
    boxSizing: "border-box"
  },
  otpDisplay: {
    fontFamily: "monospace, Courier, sans-serif",
    fontSize: "40px",
    lineHeight: "48px",
    fontWeight: "700",
    letterSpacing: "6px",
    color: "#003d9b",
    WebkitUserSelect: "all",
    userSelect: "all",
    display: "block"
  },
  tipText: {
    fontSize: "11px",
    color: "#737685",
    margin: "12px 0 0 0",
    fontStyle: "italic"
  },
  alertTable: {
    backgroundColor: "#e8edff",
    border: "1px solid #c3c6d6",
    borderRadius: "12px",
    width: "100%"
  },
  alertText: {
    fontSize: "13px",
    lineHeight: "20px",
    color: "#434654",
    padding: "16px 16px 16px 0",
    verticalAlign: "top"
  },
  footerSection: {
    backgroundColor: "#edf0ff",
    padding: "32px 40px",
    textAlign: "center",
    borderTop: "1px solid #c3c6d6"
  },
  securityTitle: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "#737685",
    display: "block",
    textTransform: "uppercase",
    marginBottom: "4px"
  },
  footerLink: {
    fontSize: "11px",
    color: "#737685",
    textDecoration: "none",
    margin: "0 10px",
    fontWeight: "600"
  }
};

export function OtpEmailTemplate({ otpCode }: OtpEmailTemplateProps) {
  // Format kode OTP agar memiliki spasi di tengah (e.g., "482 917") demi keterbacaan tinggi
  const formattedOtp = otpCode.length === 6 
    ? `${otpCode.slice(0, 3)} ${otpCode.slice(3)}` 
    : otpCode;

  return (
    <div style={styles.wrapper}>
      <table align="center" border={0} cellPadding={0} cellSpacing={0} width="100%" style={styles.containerTable}>
        <tbody>
          {/* HEADER SECTION */}
          <tr>
            <td style={styles.headerTd}>
              <table align="center" border={0} cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#003d9b"/>
                        <path d="M12 6a3.5 3.5 0 00-3.5 3.5c0 1.95 2.1 4.54 3.5 6 1.4-1.46 3.5-4.05 3.5-6A3.5 3.5 0 0012 6z" fill="#ffffff"/>
                        <circle cx="12" cy="9.5" r="1.5" fill="#003d9b"/>
                      </svg>
                    </td>
                    <td style={styles.logoText}>
                      GuardianAuth
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* HERO CONTENT */}
          <tr>
            <td style={styles.heroTd}>
              <h1 style={styles.headline}>Verify Your Email</h1>
              <p style={styles.paragraph}>
                Use the following security token to complete your sign-in process. This authentication code will expire in{" "}
                <span style={{ fontWeight: "700", color: "#003d9b" }}>15 minutes</span>.
              </p>
            </td>
          </tr>

          {/* OTP DISPLAY SECTION */}
          <tr>
            <td style={{ padding: "24px 40px", textAlign: "center" }}>
              <div style={styles.otpWrapper}>
                <span style={styles.otpDisplay}>
                  {formattedOtp}
                </span>
              </div>
              <p style={styles.tipText}>
                Tip: Sentuh dua kali pada nomor di atas untuk menyalin kode secara instan.
              </p>
            </td>
          </tr>

          {/* SECURITY WARNING ALERT BLOCK */}
          <tr>
            <td style={{ padding: "16px 40px 40px 40px" }}>
              <table border={0} cellPadding={0} cellSpacing={0} style={styles.alertTable}>
                <tbody>
                  <tr>
                    <td style={{ padding: "16px", verticalAlign: "top", width: "24px" }}>
                      <span style={{ fontSize: "18px", lineHeight: "1" }}>Info</span>
                    </td>
                    <td style={styles.alertText}>
                      If you did not request this code, please secure your credentials or{" "}
                      <a href="#" style={{ color: "#003d9b", fontWeight: "600", textDecoration: "underline" }}>
                        contact support
                      </a>{" "}
                      immediately. We prioritize your account integrity.
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* FOOTER SECTION */}
          <tr>
            <td style={styles.footerSection}>
              <div style={{ marginBottom: "16px" }}>
                <span style={styles.securityTitle}>
                  SECURITY MESSAGE
                </span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#285ab9" }}>
                  GuardianAuth Protection Subsystem
                </span>
              </div>
              
              <div style={{ margin: "16px 0" }}>
                <a href="#" style={styles.footerLink}>Support Center</a>
                <span style={{ color: "#c3c6d6" }}>|</span>
                <a href="#" style={styles.footerLink}>Privacy Policy</a>
                <span style={{ color: "#c3c6d6" }}>|</span>
                <a href="#" style={styles.footerLink}>Security Tips</a>
              </div>

              <p style={{ fontSize: "11px", color: "#737685", margin: 0, fontWeight: "500" }}>
                &copy; {new Date().getFullYear()} GuardianAuth Security. All rights reserved.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}