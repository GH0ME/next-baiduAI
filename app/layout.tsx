import './styles/global.css'
import styles from './styles/app.module.css'
import AppHeader from './components/app-header'
import Loading from './components/Loading'

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html>
      <head/>
      <body>
        <div className={styles.app}>
          <AppHeader/>
          <Loading/>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
