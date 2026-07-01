import * as React from "react";

interface RegistrationSuccessTemplateProps {
  userName: string;
  webinarTitle: string;
  startDate: string;
  loginUrl: string;
}

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
    maxWidth: "480px"
  },
  infoWrapper: {
    backgroundColor: "#f1f3ff",
    border: "1px solid #d7e2ff",
    borderRadius: "12px",
    padding: "24px",
    display: "inline-block",
    width: "100%",
    maxWidth: "480px",
    boxSizing: "border-box",
    textAlign: "left"
  },
  infoLabel: {
    fontSize: "12px",
    color: "#737685",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "600",
    margin: "0 0 4px 0"
  },
  infoValue: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#003d9b",
    margin: "0 0 16px 0",
    lineHeight: "22px"
  },
  button: {
    backgroundColor: "#003d9b",
    color: "#ffffff",
    padding: "14px 28px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    display: "inline-block",
    marginTop: "24px"
  },
  footerSection: {
    backgroundColor: "#edf0ff",
    padding: "32px 40px",
    textAlign: "center",
    borderTop: "1px solid #c3c6d6"
  }
};

export function RegistrationSuccessTemplate({ userName, webinarTitle, startDate, loginUrl }: RegistrationSuccessTemplateProps) {
  return (
    <div style={styles.wrapper}>
      <table align="center" border={0} cellPadding={0} cellSpacing={0} width="100%" style={styles.containerTable}>
        <tbody>
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
                      Geomining Official
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td style={styles.heroTd}>
              <h1 style={styles.headline}>Pendaftaran Berhasil!</h1>
              <p style={styles.paragraph}>
                Halo <strong>{userName}</strong>,<br /><br />
                Terima kasih telah mendaftar di program Masterclass kami. Kursi Anda telah berhasil diamankan.
              </p>
            </td>
          </tr>

          <tr>
            <td style={{ padding: "10px 40px 30px 40px", textAlign: "center" }}>
              <div style={styles.infoWrapper}>
                <p style={styles.infoLabel}>Program Masterclass</p>
                <p style={styles.infoValue}>{webinarTitle}</p>
                
                <p style={styles.infoLabel}>Jadwal Sesi Terdekat</p>
                <p style={{ ...styles.infoValue, marginBottom: 0 }}>{startDate}</p>
              </div>
              
              <a href={loginUrl} style={styles.button}>Akses Dashboard Pembelajaran</a>
            </td>
          </tr>

          <tr>
            <td style={styles.footerSection}>
              <p style={{ fontSize: "12px", color: "#737685", marginBottom: "16px" }}>
                Jika Anda memiliki pertanyaan, balas email ini atau hubungi tim dukungan kami.
              </p>
              <p style={{ fontSize: "11px", color: "#737685", margin: 0, fontWeight: "500" }}>
                &copy; {new Date().getFullYear()} Geomining Official. All rights reserved.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
