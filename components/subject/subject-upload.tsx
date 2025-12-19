"use client"

import { useState, useCallback, JSX }   from "react";
import { useParams }                    from "next/navigation";

import {
    Upload,
    FileSpreadsheet,
    X,
    AlertCircle,
    HardDriveDownload
}                       from "lucide-react";
import {
    useMutation,
    useQueryClient
}                       from "@tanstack/react-query";
import { useDropzone }  from "react-dropzone";
import { toast }        from "sonner";

import { Button }                   from "@/components/ui/button";
import { Card, CardContent }        from "@/components/ui/card";
import { Badge }                    from "@/components/ui/badge";
import { Alert, AlertDescription }  from "@/components/ui/alert";

import { errorToast, successToast } from "@/config/toast/toast.config";
import { Method }                   from "@/services/fetch";
import { ENV }                      from "@/config/envs/env";
import { KEY_QUERYS }               from "@/consts/key-queries";


type UploadService = 'subject' | 'offer';


interface ServiceConfig {
	url             : string;
	queryKey        : string[];
	templateFile    : string;
	successMessage  : ( count: number ) => string;
}


interface SubjectUploadProps {
	onUpload?	: ( file: File ) => void;
	onSuccess?	: ( data: any[] ) => void;
	isUploading	: boolean;
	service?	: UploadService;
}


interface UploadError {
	type	: 'format' | 'size' | 'general';
	message	: string;
}


export function SubjectUpload({
    onUpload,
    onSuccess,
    isUploading,
    service = 'subject',
}: SubjectUploadProps ): JSX.Element {
    const params                            = useParams();
    const { facultyId  }                    = params;
    const queryClient                       = useQueryClient();
	const [selectedFile, setSelectedFile]   = useState<File | null>( null );
	const [uploadError, setUploadError]     = useState<UploadError | null>( null );

	/**
	 * Service configuration
	 */
	const serviceConfig: Record<UploadService, ServiceConfig> = {
		subject: {
			url             : `${ENV.REQUEST_BACK_URL}${KEY_QUERYS.SUBJECTS}/bulk-upload/${facultyId}`,
			queryKey        : [KEY_QUERYS.SUBJECTS, facultyId as string],
			templateFile    : '/plantilla_asignatura.xlsx',
			successMessage  : ( count: number ) => `Carga completada: ${count} asignaturas creadas exitosamente`,
		},
		offer: {
			url             : `${ENV.REQUEST_BACK_URL}${KEY_QUERYS.SECTIONS}/massive-upload-offers`,
			queryKey        : [KEY_QUERYS.SECTIONS],
			templateFile    : '/plantilla_oferta.xlsx',
			successMessage  : ( count: number ) => `Carga completada: ${count} ofertas creadas exitosamente`,
		},
	};

	const config = serviceConfig[service];

	/**
	 * Validates the uploaded file
	 */
	const validateFile = useCallback(( file: File ): UploadError | null => {
		const allowedTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
			'application/vnd.ms-excel', // .xls
			'text/csv' // .csv
		];

		if ( !allowedTypes.includes( file.type )) {
			return {
				type		: 'format',
				message		: 'Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)'
			};
		}

		// Check file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB

        if ( file.size > maxSize ) {
			return {
				type	: 'size',
				message : 'El archivo no puede ser mayor a 10MB'
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
	 * API function to upload Excel file
	 */
	const uploadExcelFile = async ( file: File ): Promise<any[]> => {
		const formData = new FormData();
		formData.append( 'file', file );

		const response = await fetch( config.url, {
			method  : Method.POST,
			body    : formData,
		});

		if ( !response.ok ) {
			const errorBody = await response.json();
			throw new Error(errorBody.message || `API error: ${response.status} ${response.statusText}`);
		}

		return await response.json() as any[];
	};

	/**
	 * Mutation for bulk upload
	 */
	const bulkUploadMutation = useMutation<any[], Error, File>({
		mutationFn	: uploadExcelFile,
		onSuccess	: ( newItems ) => {
			// Update the cache only for subject service
			if ( service === 'subject' ) {
				queryClient.setQueryData<any[]>(
					config.queryKey,
					( oldData: any ) => {
						if ( !oldData ) return newItems;
						return [...oldData, ...newItems];
					}
				);
			} else {
				// For other services, just invalidate the query
				queryClient.invalidateQueries({ queryKey: config.queryKey });
			}

			// Show success message
			toast(
				config.successMessage( newItems.length ),
				successToast
			);

			// Reset form
			setSelectedFile( null );
			setUploadError( null );

			// Call external onUpload if provided
			if ( onUpload ) onUpload( selectedFile! );

			// Call onSuccess to close dialog
			if ( onSuccess ) onSuccess( newItems );
		},
		onError	: ( error ) => {
			toast( `Error al cargar archivo: ${error.message}`, errorToast );
		},
	});

	/**
	 * Handles file upload
	 */
	const handleUpload = () => {
		if ( !selectedFile ) {
			toast( 'Por favor selecciona un archivo primero', errorToast );
			return;
		}

		bulkUploadMutation.mutate( selectedFile );
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
		multiple	: false,
		disabled	: isUploading,
        accept      : {
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'application/vnd.ms-excel': ['.xls'],
			'text/csv': ['.csv']
		},
	});


	return (
		<div className="space-y-6">
			{/* Upload Area */}
			<Card>
				<CardContent className="p-0">
					<div
						{...getRootProps()}
						className={`
							border-4 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
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
						{ uploadError.message }
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
									<p className="font-medium text-sm">{ selectedFile.name }</p>

									<p className="text-xs text-muted-foreground">
										{( selectedFile.size / 1024 / 1024 ).toFixed( 2 )} MB
									</p>
								</div>

								<Badge variant="secondary">Listo</Badge>
							</div>

							<Button
								variant     = "ghost"
								size        = "sm"
								onClick     = { removeFile }
								disabled    = { isUploading }
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
                    </CardContent>
                </Card>
			)}

			{/* Upload Button */}
			{ selectedFile &&
                <Button
                    onClick     = { handleUpload }
                    disabled    = { isUploading }
                    className   = "w-full gap-2"
                >
                    <Upload className="h-4 w-4" />
                    { isUploading ? 'Subiendo...' : 'Subir Archivo' }
                </Button>
			}

			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<h4 className="font-medium mb-2">Instrucciones para el archivo Excel:</h4>

					<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
						<li>Solo debe ser formato .xls (Excel).</li>
						<li>No puede superar los 10mb.</li>
						<li>Solo se realiza la lectura de la hoja 1.</li>
						<li>Si se registra con algún problema puedes modificarlo manualmente.</li>
					</ul>
				</CardContent>
			</Card>

            <Card>
				<CardContent className="p-4 w-full">
					<a
                        download
                        href        = { config.templateFile }
                        className   = "border-4 hover:border-primary/50 rounded-lg cursor-pointer transition-colors border-dashed px-4 py-2 w-full grid justify-center content-center gap-1"
                    >
                        <span className="flex justify-center">
                            <HardDriveDownload className="h-9 w-9 text-muted-foreground" />
                        </span>

                        <h4 className="font-medium mb-2">Descarga la plantilla</h4>
                    </a>
				</CardContent>
			</Card>
		</div>
	);
}
