export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-4 px-4 md:px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Auto-Detailing Business Management. All rights reserved.
        </p>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <a href="#" className="text-sm text-muted-foreground hover:underline">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:underline">
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}
