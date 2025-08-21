"use client"

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { errorToast, successToast } from "@/config/toast/toast.config";


interface SubjectUploadProps {
	onUpload		: ( file: File ) => void;
	isUploading		: boolean;
}


interface UploadError {
	type	: 'format' | 'size' | 'general';
	message	: string;
}


export function SubjectUpload({ onUpload, isUploading }: SubjectUploadProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>( null );
	const [uploadError, setUploadError] = useState<UploadError | null>( null );


	/**
	 * Validates the uploaded file
	 */
	const validateFile = useCallback(( file: File ): UploadError | null => {
		// Check file type
		const allowedTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
			'application/vnd.ms-excel', // .xls
			'text/csv' // .csv
		];

		if ( !allowedTypes.includes( file.type ) ) {
			return {
				type		: 'format',
				message		: 'Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)'
			};
		}

		// Check file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if ( file.size > maxSize ) {
			return {
				type		: 'size',
				message		: 'El archivo no puede ser mayor a 10MB'
			};
		}

		return null;
	}, []);


	/**
	 * Handles file drop or selection
	 */
	const onDrop = useCallback(( acceptedFiles: File[] ) => {
		setUploadError( null );

		if ( acceptedFiles.length === 0 ) {
			setUploadError({
				type		: 'general',
				message		: 'No se pudo procesar el archivo seleccionado'
			});
			return;
		}

		const file = acceptedFiles[0];
		const validationError = validateFile( file );

		if ( validationError ) {
			setUploadError( validationError );
			toast( validationError.message, errorToast );
			return;
		}

		setSelectedFile( file );
		toast( 'Archivo seleccionado correctamente', successToast );
	}, [validateFile]);


	/**
	 * Handles file upload
	 */
	const handleUpload = () => {
		if ( !selectedFile ) {
			toast( 'Por favor selecciona un archivo primero', errorToast );
			return;
		}

		onUpload( selectedFile );
	};


	/**
	 * Removes selected file
	 */
	const removeFile = () => {
		setSelectedFile( null );
		setUploadError( null );
	};


	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept		: {
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'application/vnd.ms-excel': ['.xls'],
			'text/csv': ['.csv']
		},
		multiple	: false,
		disabled	: isUploading
	});


	return (
		<div className="space-y-6">
			{/* Upload Area */}
			<Card>
				<CardContent className="p-0">
					<div
						{...getRootProps()}
						className={`
							border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
							${isDragActive 
								? 'border-primary bg-primary/5' 
								: 'border-muted-foreground/25 hover:border-primary/50'
							}
							${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
						`}
					>
						<input {...getInputProps()} />
						
						<div className="flex flex-col items-center gap-4">
							<div className="p-4 rounded-full bg-muted">
								<Upload className="h-8 w-8 text-muted-foreground" />
							</div>
							
							<div className="space-y-2">
								<h3 className="text-lg font-semibold">
									{isDragActive 
										? 'Suelta el archivo aquí' 
										: 'Arrastra y suelta tu archivo Excel'
									}
								</h3>
								
								<p className="text-sm text-muted-foreground">
									o haz clic para seleccionar un archivo
								</p>
								
								<p className="text-xs text-muted-foreground">
									Formatos soportados: .xlsx, .xls, .csv (máx. 10MB)
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Error Display */}
			{uploadError && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{uploadError.message}
					</AlertDescription>
				</Alert>
			)}

			{/* Selected File Display */}
			{selectedFile && (
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
									<FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
								</div>
								
								<div className="flex-1">
									<p className="font-medium text-sm">{selectedFile.name}</p>
									<p className="text-xs text-muted-foreground">
										{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
								
								<Badge variant="secondary">Listo</Badge>
							</div>
							
							<Button
								variant="ghost"
								size="sm"
								onClick={removeFile}
								disabled={isUploading}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
				</CardContent>
			</Card>
			)}

			{/* Upload Button */}
			{selectedFile && (
				<div className="flex justify-end">
					<Button
						onClick={handleUpload}
						disabled={isUploading}
						className="min-w-32"
					>
						{isUploading ? 'Subiendo...' : 'Subir Archivo'}
					</Button>
				</div>
			)}

			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<h4 className="font-medium mb-2">Instrucciones para el archivo Excel:</h4>
					<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
						<li>Solo debe ser formato .xls (Excel)</li>
						<li>No puede superar los 15mb.</li>
						<li>Solo se toma en la hoja 1</li>
						<li>Si se registra con algún problema puedes modificarlo manualmente.</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}