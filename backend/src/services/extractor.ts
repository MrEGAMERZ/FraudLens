import * as path from 'path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require('pdf-parse')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mammoth = require('mammoth')

export interface ExtractedDocument {
  text: string
  charCount: number
  fileType: 'pdf' | 'docx' | 'txt' | 'unknown'
  filename: string
}

/**
 * Extracts plain text from document buffers (PDF, DOCX, TXT).
 * Includes robust validation and actionable error messages.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimetype: string,
  originalname: string
): Promise<ExtractedDocument> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Uploaded file is empty (0 bytes).')
  }

  const ext = path.extname(originalname).toLowerCase()
  let text = ''
  let fileType: ExtractedDocument['fileType'] = 'unknown'

  try {
    if (ext === '.pdf' || mimetype === 'application/pdf') {
      fileType = 'pdf'
      const parser = new PDFParse({ data: buffer })
      await parser.load()
      const result = await parser.getText()
      await parser.destroy().catch(() => {})
      text = result.text || ''
    } else if (
      ext === '.docx' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      fileType = 'docx'
      const result = await mammoth.extractRawText({ buffer })
      text = result.value || ''
    } else if (
      ext === '.txt' ||
      ext === '.md' ||
      ext === '.rtf' ||
      mimetype.startsWith('text/')
    ) {
      fileType = 'txt'
      text = buffer.toString('utf-8')
    } else {
      // Attempt UTF-8 decode as fallback if text-like
      try {
        const candidate = buffer.toString('utf-8')
        // Simple check if it looks like UTF-8 printable text
        if (/^[\x20-\x7E\r\n\t\u00A0-\uFFFF]{20,}$/.test(candidate.slice(0, 500))) {
          fileType = 'txt'
          text = candidate
        } else {
          throw new Error(`Unsupported document format '${ext || mimetype}'. Allowed formats: PDF (.pdf), Word (.docx), Plain Text (.txt).`)
        }
      } catch {
        throw new Error(`Unsupported document format '${ext || mimetype}'. Allowed formats: PDF (.pdf), Word (.docx), Plain Text (.txt).`)
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Unsupported document format')) {
      throw err
    }
    console.error(`[DOCUMENT_EXTRACTOR] Error parsing ${originalname} (${fileType}):`, err.message)
    throw new Error(`Failed to parse ${fileType.toUpperCase()} file: ${err.message}`)
  }

  const cleaned = text.trim()

  if (cleaned.length < 20) {
    throw new Error(
      `The uploaded ${fileType.toUpperCase()} document contains insufficient readable text (${cleaned.length} characters). If this is a scanned image, please upload a document with selectable text or paste the content directly.`
    )
  }

  return {
    text: cleaned,
    charCount: cleaned.length,
    fileType,
    filename: originalname
  }
}
