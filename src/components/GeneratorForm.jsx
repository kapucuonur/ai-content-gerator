import React, { useState } from 'react';
import './GeneratorForm.css';

const GeneratorForm = ({ onGenerate, isLoading }) => {
    const [formData, setFormData] = useState({
        prompt: '',
        tone: 'Professional',
        length: 'Medium',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.prompt.trim()) return;
        onGenerate(formData);
    };

    return (
        <form className="generator-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="prompt">What would you like to create?</label>
                <textarea
                    id="prompt"
                    name="prompt"
                    value={formData.prompt}
                    onChange={handleChange}
                    placeholder="e.g., A blog post about the future of AI..."
                    rows={4}
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="tone">Tone</label>
                    <select id="tone" name="tone" value={formData.tone} onChange={handleChange}>
                        <option value="Professional">Professional</option>
                        <option value="Casual">Casual</option>
                        <option value="Excited">Excited</option>
                        <option value="Witty">Witty</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="length">Length</label>
                    <select id="length" name="length" value={formData.length} onChange={handleChange}>
                        <option value="Short">Short (~100 words)</option>
                        <option value="Medium">Medium (~300 words)</option>
                        <option value="Long">Long (~600 words)</option>
                    </select>
                </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Generating Magic...' : 'Generate Content'}
            </button>
        </form>
    );
};

export default GeneratorForm;
