import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import logger from '../middleware/logger.js';
import { MulterAzureStorage } from 'multer-azure-blob-storage';
import { v4 } from 'uuid';
import path from 'path';

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY;
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(
	`https://${accountName}.blob.core.windows.net`,
	sharedKeyCredential
);

export const azureStorage = new MulterAzureStorage({
	connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
	accessKey: accountKey,
	accountName: accountName,
	containerName: 'images',
	blobName: (req, file) => {
		return new Promise((resolve, reject) => {
			const blobName = Date.now() + '-' + v4() + path.extname(file.originalname);
			resolve(blobName);
		});
	},
	metadata: { author: 'ECommerce Team' },
	containerAccessLevel: 'blob',
	urlExpirationTime: 60
});

export async function deleteBlob(containerName, blobName) {
	// create container client
	const containerClient = await blobServiceClient.getContainerClient(containerName);

	// include: Delete the base blob and all of its snapshots.
	// only: Delete only the blob's snapshots and not the blob itself.
	const options = {
		deleteSnapshots: 'include' // or 'only'
	};

	// Create blob client from container client
	const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

	await blockBlobClient.deleteIfExists(options);

	logger.info(`deleted blob ${blobName}`);
}
