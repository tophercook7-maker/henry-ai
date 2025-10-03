#!/usr/bin/env python3
import re

# Read the file
with open('server-ultimate.mjs', 'r') as f:
    content = f.read()

# Fix 1: Add error checking after chunk processing
old_chunk_code = '''          const data = await response.json();
          chunkSummaries.push(data.choices[0].message.content);
          
          // Accumulate usage
          totalUsage.prompt_tokens += data.usage.prompt_tokens;
          totalUsage.completion_tokens += data.usage.completion_tokens;
          totalUsage.total_tokens += data.usage.total_tokens;'''

new_chunk_code = '''          const data = await response.json();
          
          // Check for API errors
          if (!response.ok || !data.choices || !data.choices[0]) {
            console.error('OpenAI API error:', data.error || data);
            throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
          }
          
          chunkSummaries.push(data.choices[0].message.content);
          
          // Accumulate usage (with safety checks)
          if (data.usage) {
            totalUsage.prompt_tokens += data.usage.prompt_tokens || 0;
            totalUsage.completion_tokens += data.usage.completion_tokens || 0;
            totalUsage.total_tokens += data.usage.total_tokens || 0;
          }'''

content = content.replace(old_chunk_code, new_chunk_code)

# Fix 2: Add error checking for final summary
old_final_code = '''        const finalData = await finalResponse.json();
        
        res.json({
          result: finalData.choices[0].message.content,'''

new_final_code = '''        const finalData = await finalResponse.json();
        
        // Check for API errors in final response
        if (!finalResponse.ok || !finalData.choices || !finalData.choices[0]) {
          console.error('OpenAI API error in final summary:', finalData.error || finalData);
          throw new Error(`OpenAI API error: ${finalData.error?.message || 'Unknown error'}`);
        }
        
        res.json({
          result: finalData.choices[0].message.content,'''

content = content.replace(old_final_code, new_final_code)

# Fix 3: Add error checking for regular (non-chunked) processing
old_regular_code = '''      const data = await response.json();
      const costs = calculateCosts(data.usage, model);'''

new_regular_code = '''      const data = await response.json();
      
      // Check for API errors
      if (!response.ok || !data.choices || !data.choices[0]) {
        console.error('OpenAI API error:', data.error || data);
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
      }
      
      const costs = calculateCosts(data.usage, model);'''

content = content.replace(old_regular_code, new_regular_code)

# Write the fixed file
with open('server-ultimate.mjs', 'w') as f:
    f.write(content)

print("✅ Fixed server-ultimate.mjs with proper error handling!")