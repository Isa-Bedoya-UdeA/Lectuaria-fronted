import { RouterProvider } from "react-router-dom"
import { router } from "@/routes/router"
import { AuthProvider } from "@/context/AuthContext"
import { BooksProvider } from "@/context/BooksContext"
import "@/styles/global.scss"

function App() {
	return (
		<AuthProvider>
			<BooksProvider>
				<RouterProvider router={router} />
			</BooksProvider>
		</AuthProvider>
	)
}

export default App
