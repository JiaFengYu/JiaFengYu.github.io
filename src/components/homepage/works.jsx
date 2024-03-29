import React from "react";
import { faBriefcase } from "@fortawesome/free-solid-svg-icons";

import Card from "../common/card";

import "./styles/works.css";

const Works = () => {
	return (
		<div className="works">
			<Card
				icon={faBriefcase}
				title="Work"
				body={
					<div className="works-body">
						<div className="work">
							<img
								src="./oncai.png"
								alt="oncai"
								className="work-image"
							/>
							<div className="work-title">Onc.AI</div>
							<div className="work-subtitle">
								Machine Learning Engineer
							</div>
							<div className="work-duration">Jan 2024 - Present</div>
						</div>

						<div className="work">
							<img
								src="./uw.png"
								alt="university of waterloo"
								className="work-image"
							/>
							<div className="work-title">University of Waterloo</div>
							<div className="work-subtitle">
							    Undergraduate Research Assistant	
							</div>
							<div className="work-duration">Oct 2023 - Present</div>
						</div>

						<div className="work">
							<img
								src="./ledn.png"
								alt="ledn"
								className="work-image"
							/>
							<div className="work-title">Ledn</div>
							<div className="work-subtitle">
                                Quantitative Developer
							</div>
							<div className="work-duration">Sept 2022 - Dec 2022</div>
						</div>
					</div>
				}
			/>
		</div>
	);
};

export default Works;
