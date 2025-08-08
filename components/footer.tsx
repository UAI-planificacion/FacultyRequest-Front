import Image from "next/image";

export function Footer({
	styles,
}: {
	styles?: string,
}) {
	return (
		<footer className={`bg-black m-0 justify-center flex border-t-2 py-4 ${styles}`}>
			<figure>
				<Image
					className   = "rounded-lg"
					src         = "https://mailing20s.s3.amazonaws.com/templtates/crecer2023.png"
					alt         = "crecer"
					width       = {150}
					height      = {150}
					title       = "Crecer+"
				/>
			</figure>
		</footer>
    );
}
