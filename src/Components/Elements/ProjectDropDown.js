
import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { AuthContext } from "../../ContextProvider/AuthContext";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../Services/ApiService";
import { DelCookie, GetCookie, SetCookie } from "../../Helpers/Helper";
import { LayoutContext } from "../../ContextProvider/LayoutContext";

const ProjectDropDown = (props) => {
    const {user:AuthUser, updateData,projectId = null, setProjectId} = useContext(AuthContext)
    const {setReloadPage} = useContext(LayoutContext)
    const user = AuthUser?.user || {}
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState({})

    useEffect(() => {
        if(projects.length == 0 ){
            getProjects()
        }
    }, [])

    const getProjects = async () => {
        let payloadUrl = `user/listProjects`
        let method = "GET"
        
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let projectsArr = res.results
            setProjects(oldVal => ([...projectsArr]))
            if (projectsArr.length > 0) {
                
                let savedProject = GetCookie('selectedProject') ? JSON.parse(GetCookie('selectedProject')) : null
                if(savedProject){
                    savedProject = projectsArr.find(item => item.project_id == savedProject.project_id) || null
                    if(!savedProject){
                        setProjectId(null)
                        let delProject = DelCookie('selectedProject')
                    }
                }
                if (!savedProject) {
                    let project = projectsArr[0]
                    changeProject({value:project.project_id,label:project.name}, projectsArr)
                } else {
                    setProjectId(Number(savedProject.project_id))
                    setSelectedProject({value:savedProject.project_id, label: savedProject.name })
                }
            }
        }
    }

    const  changeProject = (selected = null,projectsArr = null) =>  {
        const projectsList = (projectsArr) || projects
        let project = projectsList.find(item => item.project_id == selected.value)
        if(!selected || !project){
            return false
        }
        SetCookie("selectedProject",JSON.stringify(project))
        setProjectId(project.project_id)
        setSelectedProject(selected);
        setReloadPage(true)
    }
    

    return (
        <React.Fragment>

            <div className="project_dropdown_section w200">
                <Select
                    isClearable={false}
                    value={selectedProject}
                    onChange={(selected,el) => changeProject(selected)}
                    options={projects.length > 0 ? projects.map(item => ({ value: item.project_id, label: item.name }))  : []}
                />
            </div>
        </React.Fragment>
    )
}

export default ProjectDropDown