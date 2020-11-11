import React from 'react'
import useDropzoneDefault from '../../hooks/useDropzoneDefault'

import { ReactComponent as UploadIcon } from '../../assets/upload__new.svg'

import * as Styled from './Styled'

const DropzoneArea = ({ projectId, sectionId }) => {
  const { getRootProps, getInputProps, open, isDragActive, uploading } = useDropzoneDefault(projectId, sectionId)


  return (
    <Styled.Wrapper {...getRootProps()} isDragActive={isDragActive}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <Styled.ActiveWrapper>
          <Styled.DropItTextPrimary>Drop it like it's hot</Styled.DropItTextPrimary>
          <Styled.DropItTextSecondary>Add files by dropping them in this window</Styled.DropItTextSecondary>
        </Styled.ActiveWrapper>
      ) : (
        <Styled.InactiveWrapper>
          <Styled.UploadButton type="button" onClick={open}>
            <UploadIcon /> Upload Files
          </Styled.UploadButton>
          <p>Or Drag and drop your files into the canvas space</p>
        </Styled.InactiveWrapper>
      )}
    </Styled.Wrapper>
  )
}

export default DropzoneArea
