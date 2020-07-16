import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ProjectType } from '../types'
import {
  ProjectsWrapper,
  ProjectsList,
  CanvasArea,
  ProjectTitle,
  ProjectsTopBar,
  InviteButton,
  ProjectBarRight,
} from './Styled'
import ProjectModal from '../ProjectModal'
import ProjectInviteModal from '../ProjectInviteModal'
import LeftPanel from './LeftPanel'
import * as actions from './actions'
import CanvasesList from './CanvasesList'
import { authCheck } from './actions'

const Projects = ({ fetchData, project, user, deleteProject, createProject, sendInvites, authCheck, ...props }) => {
  const [showModal, setShowModal] = useState(false)
  const [showModalInvite, setShowModalInvite] = useState(false)
  const [isCreate, setIsCreate] = useState(true)
  const [updateProject, setUpdateProject] = useState(null)
  const [projectId, setProjectId] = useState(null)
  const [activeProject, setActiveProject] = useState({})

  useEffect(() => {
    authCheck()
    fetchData()
  }, []) // eslint-disable-line
  console.log('OVDEEE');
  console.log(user);
  console.log(project);
  const isModerator = user && user.isModerator()

  // set default active project after data fetched
  if (project.length) {
    // the use case for teacher account
    const firstProject = isModerator ? project.filter(p => p.parent_id === null)[0] : project[0]
    if (firstProject && !activeProject.id)
      setActiveProject(
        isModerator
          ? firstProject
          : {
              id: firstProject.parent_id,
              title: firstProject.parent_title || 'No title',
            },
      )
  }

  const createButtonClicked = (e, parent_id) => {
    setProjectId(parent_id)
    setShowModal(true)
    setIsCreate(true)
    setUpdateProject(null)
  }

  const editButtonClicked = project => {
    setShowModal(true)
    setIsCreate(false)
    setUpdateProject(project)
  }

  const onProjectDelete = projectId => {
    deleteProject(projectId)
    updateActiveProject()
  }

  const onFinishCreateEdit = project => {
    setShowModal(false)
    isCreate ? createProject(project) : props.updateProject(project)
    updateActiveProject()
  }

  const updateActiveProject = () => {
    let new_active_project = project.filter(p => p.id === activeProject.id)
    setActiveProject(new_active_project.length > 0 ? new_active_project[0] : {})
  }

  return (
    <ProjectsWrapper>
      <LeftPanel
        isModerator={isModerator}
        activeProjectId={activeProject.id}
        onChangeActiveProject={setActiveProject}
        onCreate={createButtonClicked}
        onEdit={editButtonClicked}
        projects={project}
      />
      <CanvasArea>
        <ProjectsList>
          {activeProject.title && (
            <ProjectsTopBar>
              <ProjectTitle>{activeProject.title}</ProjectTitle>
              {isModerator && (
                <ProjectBarRight>
                  <InviteButton onClick={() => setShowModalInvite(true)}>Invite</InviteButton>
                </ProjectBarRight>
              )}
            </ProjectsTopBar>
          )}
          <CanvasesList
            isModerator={isModerator}
            projects={project}
            onEdit={editButtonClicked}
            onCreate={createButtonClicked}
            activeProjectId={activeProject.id}
            onDelete={onProjectDelete}
          />
        </ProjectsList>
      </CanvasArea>

      {showModal && (
        <ProjectModal
          onSave={onFinishCreateEdit}
          updateProject={updateProject}
          onClose={() => setShowModal(false)}
          parentId={projectId}
          onDelete={onProjectDelete}
        />
      )}
      {showModalInvite && (
        <ProjectInviteModal
          onSave={sendInvites}
          updateProject={updateProject}
          onClose={() => setShowModalInvite(false)}
          projectId={activeProject.id}
        />
      )}
    </ProjectsWrapper>
  )
}

Projects.propTypes = {
  projects: PropTypes.arrayOf(ProjectType),
  user: PropTypes.object,
}

export default connect(
  ({ project, canvases, user }) => ({ project, canvases, user }),
  dispatch => bindActionCreators({ ...actions }, dispatch),
)(Projects)
